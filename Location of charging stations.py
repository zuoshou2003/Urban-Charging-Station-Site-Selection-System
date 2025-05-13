import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# 数据加载和预处理
def load_data():
    # 加载社区数据
    community_data = pd.read_excel('pop.xlsx')
    demand_points = community_data[['POINT_X', 'POINT_Y']].values  # 需求点为社区中心点
    population = community_data['P041221'].values  # 人口数量，可用于加权

    # 加载现有充电站数据
    existing_stations = pd.read_excel('charging_stations.xlsx')
    existing_facilities = existing_stations[['lng', 'lat']].values  # 现有充电站位置

    # 新建候选位置可以是停车场
    parking_data=pd.read_excel('park.xlsx')
    candidate_facilities = parking_data[['x', 'y']].values

    return demand_points, population, existing_facilities, candidate_facilities

# 计算Haversine距离
def haversine(lat1, lon1, lat2, lon2):
    """计算两个经纬度点之间的Haversine距离（单位：公里）"""
    R = 6371.0  # 地球半径（公里）
    lat1 = np.radians(lat1)
    lon1 = np.radians(lon1)
    lat2 = np.radians(lat2)
    lon2 = np.radians(lon2)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat / 2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    distance = R * c
    return distance

# 计算覆盖矩阵
def calculate_coverage_matrix(demand_points, existing_facilities, candidate_facilities, cover_radius):
    # 计算现有充电站的覆盖矩阵
    existing_coverage = np.zeros((len(existing_facilities), len(demand_points)), dtype=bool)
    for i in range(len(existing_facilities)):
        for j in range(len(demand_points)):
            distance = haversine(existing_facilities[i][1], existing_facilities[i][0], demand_points[j][1], demand_points[j][0])
            existing_coverage[i, j] = (distance <= cover_radius)

    # 计算候选新建充电站的覆盖矩阵
    candidate_coverage = np.zeros((len(candidate_facilities), len(demand_points)), dtype=bool)
    for i in range(len(candidate_facilities)):
        for j in range(len(demand_points)):
            distance = haversine(candidate_facilities[i][1], candidate_facilities[i][0], demand_points[j][1], demand_points[j][0])
            candidate_coverage[i, j] = (distance <= cover_radius)

    # 合并覆盖矩阵（现有充电站的覆盖范围已经存在，新建充电站的覆盖范围需要叠加）
    total_coverage = np.any(existing_coverage, axis=0)  # 现有充电站的总覆盖情况
    candidate_coverage = np.logical_and(candidate_coverage, ~total_coverage[np.newaxis, :])  # 新建充电站只能覆盖未被现有充电站覆盖的区域

    return existing_coverage, candidate_coverage

# 可视化初始设施和需求点分布
def plot_initial_points(existing_facilities, candidate_facilities, demand_points, population):
    plt.figure(figsize=(10, 8))

    # 绘制现有充电站
    plt.scatter(existing_facilities[:, 0], existing_facilities[:, 1], s=100, c='gray', marker='s', edgecolor='black', label='Existing Charging Stations')

    # 绘制候选新建充电站
    plt.scatter(candidate_facilities[:, 0], candidate_facilities[:, 1], s=70, c='orange', marker='s', alpha=0.5, label='Candidate Locations')

    # 绘制需求点（蓝色圆点，大小与人口相关）
    sizes = population * 0.1  # 调整大小以便可视化
    plt.scatter(demand_points[:, 0], demand_points[:, 1], s=sizes, c='blue', alpha=0.6, label='Communities (Size by Population)')

    plt.title("Initial Facilities and Demand Points Distribution")
    plt.xlabel("Longitude")
    plt.ylabel("Latitude")
    plt.legend(loc='upper right')
    plt.grid(True, alpha=0.3)
    plt.show()

# 遗传算法相关函数
def fitness(individual):
    selected = np.argsort(individual)[-P:]  # 选择优先级最高的P个设施
    covered = np.any(candidate_coverage[selected], axis=0)  # 新建充电站覆盖情况
    total_covered = np.logical_or(existing_total_coverage, covered)  # 总覆盖情况（现有+新建）
    covered_population = population[total_covered].sum()  # 覆盖的人口数量
    return covered_population

def repair_individual(individual):
    """确保个体编码中选择优先级最高的P个设施，并强化其权重"""
    top_indices = np.argsort(individual)[-P:]
    new_individual = np.zeros_like(individual)
    new_individual[top_indices] = np.random.uniform(0.7, 1.0, size=P)
    non_top = np.setdiff1d(np.arange(N_CANDIDATE), top_indices)
    new_individual[non_top] = np.random.uniform(0.0, 0.3, size=N_CANDIDATE - P)
    return new_individual

def select(population, fitnesses):
    """锦标赛选择"""
    selected = []
    for _ in range(POP_SIZE):
        idx = np.random.choice(len(population), size=3, replace=False)
        best = idx[np.argmax([fitnesses[i] for i in idx])]
        selected.append(population[best])
    return np.array(selected)

def crossover(parent1, parent2):
    """算术交叉 + 修复"""
    alpha = np.random.rand()
    child1 = alpha * parent1 + (1 - alpha) * parent2
    child2 = alpha * parent2 + (1 - alpha) * parent1
    return repair_individual(child1), repair_individual(child2)

def mutate(individual):
    """高斯变异 + 修复"""
    mask = np.random.rand(N_CANDIDATE) < MUTATION_RATE
    noise = np.random.normal(scale=MUTATION_SCALE, size=N_CANDIDATE)
    mutated = np.clip(individual + mask * noise, 0, 1)
    return repair_individual(mutated)

# 可视化最终选址结果及覆盖范围
def plot_solution(existing_facilities, candidate_facilities, demand_points, coverage_matrix, selected, cover_radius, population):
    plt.figure(figsize=(10, 8))
    ax = plt.gca()

    # 计算覆盖状态
    candidate_covered = np.any(coverage_matrix[selected], axis=0)
    total_covered = np.logical_or(existing_total_coverage, candidate_covered)

    # 绘制现有充电站
    plt.scatter(existing_facilities[:, 0], existing_facilities[:, 1], s=100, c='gray', marker='s', edgecolor='black', label='Existing Charging Stations')

    # 绘制新建充电站覆盖半径（先绘制在底层）
    for idx in selected:
        lon, lat = candidate_facilities[idx]
        delta = cover_radius / 111.0  # 1度约111公里
        circle = plt.Circle((lon, lat), delta, edgecolor='red', linestyle='--', fill=False, alpha=0.3, linewidth=1.5)
        ax.add_artist(circle)

    # 绘制新建充电站
    for i, (lon, lat) in enumerate(candidate_facilities):
        if i in selected:
            # 选中设施（红色星星）
            plt.scatter(lon, lat, s=150, c='red', marker='*', edgecolor='black', label='New Selected Facility')
            plt.text(lon + 0.001, lat + 0.001, f'F{i}', fontsize=8, ha='left', va='bottom', color='darkred')
        else:
            # 未选设施（灰色圆圈）
            plt.scatter(lon, lat, s=70, c='lightgray', marker='s', edgecolor='gray', alpha=0.7)

    # 绘制需求点（覆盖/未覆盖）
    for j, (lon, lat) in enumerate(demand_points):
        color = 'blue' if total_covered[j] else 'lightgray'
        alpha = 0.9 if total_covered[j] else 0.4
        size = population[j] * 0.1  # 根据人口数量调整大小
        plt.scatter(lon, lat, s=size, c=color, alpha=alpha, edgecolor='black' if total_covered[j] else None)

    # 添加图例
    legend_elements = [
        plt.Line2D([0], [0], marker='s', color='w', markersize=10, markerfacecolor='gray', label='Existing Facility'),
        plt.Line2D([0], [0], marker='*', color='w', markersize=10, markerfacecolor='red', label='New Selected Facility'),
        plt.Line2D([0], [0], marker='o', color='w', markersize=8, markerfacecolor='blue', label='Covered Demand'),
        plt.Line2D([0], [0], marker='o', color='w', markersize=8, markerfacecolor='lightgray', label='Uncovered Demand'),
        plt.Line2D([0], [0], color='red', linestyle='--', alpha=0.3, linewidth=1.5, label=f'Coverage Radius ({cover_radius} km)')
    ]
    plt.legend(handles=legend_elements, loc='upper right')

    ax.set_aspect('equal')
    plt.title(f"Optimal New Facilities Selection (Covered Population: {population[total_covered].sum()})")
    plt.xlabel("Longitude")
    plt.ylabel("Latitude")
    plt.grid(True, alpha=0.3)
    plt.show()

if __name__ == '__main__':
    # 参数设置
    POP_SIZE = 100          # 种群大小
    P = 20                   # 需建设的设施数量
    MUTATION_RATE = 0.1     # 变异概率
    MUTATION_SCALE = 0.1    # 变异强度
    CXPB = 0.8              # 交叉概率
    GEN_MAX = 200           # 最大迭代次数
    COVER_RADIUS = 5        # 覆盖半径（公里）

    # 加载数据
    demand_points, population, existing_facilities, candidate_facilities = load_data()
    N_CANDIDATE = len(candidate_facilities)  # 新建候选设施数量
    N_DEMAND = len(demand_points)   # 需求点数量（社区数量）

    # 计算覆盖矩阵
    existing_coverage, candidate_coverage = calculate_coverage_matrix(demand_points, existing_facilities, candidate_facilities, COVER_RADIUS)
    existing_total_coverage = np.any(existing_coverage, axis=0)  # 现有充电站的总覆盖情况

    # 可视化初始分布
    plot_initial_points(existing_facilities, candidate_facilities, demand_points, population)

    # 初始化种群：生成随机个体并修复
    population_ga = np.random.rand(POP_SIZE, N_CANDIDATE)
    population_ga = np.array([repair_individual(ind) for ind in population_ga])

    best_fitness = []

    for gen in range(GEN_MAX):
        # 计算适应度
        fitnesses = [fitness(ind) for ind in population_ga]
        best_fitness.append(np.max(fitnesses))

        # 选择
        selected = select(population_ga, fitnesses)

        # 交叉与变异
        offspring = []
        for i in range(0, POP_SIZE, 2):
            if i + 1 >= len(selected):
                break  # 处理奇数种群
            if np.random.rand() < CXPB:
                child1, child2 = crossover(selected[i], selected[i + 1])
                offspring.extend([child1, child2])
            else:
                offspring.extend([selected[i], selected[i + 1]])

        # 变异并修复
        offspring = [mutate(ind) for ind in offspring]
        population_ga = np.array(offspring)

        # 输出进度
        print(f"Gen {gen}: Best = {best_fitness[-1]}")

    # 输出最优解
    best_idx = np.argmax([fitness(ind) for ind in population_ga])
    best_solution = population_ga[best_idx]
    selected_facilities = np.argsort(best_solution)[-P:]
    print("Selected new facilities indices:", selected_facilities)

    # 输出新建点的坐标
    selected_coordinates = candidate_facilities[selected_facilities]
    print("Selected new facilities coordinates:")
    for i, coord in enumerate(selected_coordinates):
        print(f"Facility {i}: Longitude = {coord[0]}, Latitude = {coord[1]}")

    # 可视化结果
    plot_solution(existing_facilities, candidate_facilities, demand_points, candidate_coverage, selected_facilities, COVER_RADIUS, population)